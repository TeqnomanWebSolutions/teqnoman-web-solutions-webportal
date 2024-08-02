import NextAuth, { getServerSession } from "next-auth";
import jwt from "jsonwebtoken";
import Credentials from "next-auth/providers/credentials";
import { instance } from "@/utils/Apiconfig";
import { decodePassword } from "../login";

const options = {
    providers: [
        Credentials({
            type: 'credentials',
            credentials: {},
            async authorize(credentials, req) {

                const { email, password } = credentials;
                const data = await authenticateUser(email, password, req.headers.origin);
                if (data) {
                    const token = jwt.sign({ id: data._id, email: data.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
                    return data;
                } else {
                    return null;
                }
            },
        }),
    ],
    pages: { signIn: '/auth/SignIn', error: '/auth/SignIn' },
    session: { jwt: true, expiresIn: "1h" },
    jwt: { secret: process.env.JWT_SECRET, expiresIn: "1h" },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.email = user.email;
                token.status = user.status;
                token.role = user.role;
                token.id = user._id;
                token.accessModules = user.accessModules;
                token.lead = user.lead;
            }
            return token;
        },
        async session({ session, token, user }) {
            if (token) {
                session.user.email = token.email;
                session.user.status = token.status;
                session.user.role = token.role;
                session.user.id = token.id;
                session.user.accessToken = token.accessToken;
                session.user.accessModules = token.accessModules;
                session.user.lead = token.lead;
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            let redirectURL = process.env.HOST ? process.env.HOST : "http://localhost:3000";
            return `${redirectURL}/verify`;
        }
    },
};


export default (req, res) => NextAuth(req, res, options);

async function authenticateUser(email, password, url) {
    const { data } = await instance.post(`${url}/api/login`, { email, password });
    const accessModules = (await instance.get(`${url}/api/user_access?id=${data._id}`));
    data.accessModules = accessModules.data;
    const leadData = await instance.get(`${url}/api/leads?check=1&uid=${data._id}`);
    if (leadData?.data && leadData?.data?.total > 0) {
        data.lead = true;
    } else {
        data.lead = false;
    }
    const isCorrect = await decodePassword(password, data.password)
    if (data.email === email && isCorrect) {
        delete data.password;
        return data;
    } else {
        return null;
    }
}