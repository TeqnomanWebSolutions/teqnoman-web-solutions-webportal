import { employees, getAdminCollection } from '../../utils/mongodb'
import cookie from 'cookie'
import bcrypt from 'bcryptjs'
export const decodePassword = async (password, hashedPassowrd) => await bcrypt.compare(password, hashedPassowrd)
export default async function handler(req, res) {

    const adminCollection = await getAdminCollection();
    const employee = await employees();

    if (req.method === 'POST') {
        const { email, password } = req.body

        const admin = await adminCollection.findOne({ email });
        const employ = await employee.findOne({ email });
        let token;
        if (admin) {
            token = admin._id.toString();
        }
        else if (employ) {
            token = employ._id.toString();
        }
        else {
            return res.json({ message: 'User not found' })
        }


        res.setHeader(
            'Set-Cookie',
            cookie.serialize('token', token, {
                httpOnly: true,
                maxAge: 60 * 60 * 24,
                path: '/',
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
            })
        )
        if (admin) {
            const isCorrect = await decodePassword(password, admin.password)
            if (isCorrect) {
                await adminCollection.updateOne(
                    { _id: admin._id },
                    { $set: { last_login: new Date() } }
                );
                admin.role = "admin";
                return res.status(200).json(admin)
            }
        }

        if (employ) {
            const isCorrect =await decodePassword(password, employ.password)
            
            if (isCorrect) {
                employ.role = "employee";
                return res.status(200).json(employ)
            }
        }
        return res.json({ message: 'incorrect email or password', success: false })

    }
}
