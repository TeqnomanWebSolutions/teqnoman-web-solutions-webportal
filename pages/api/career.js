import { secureAccess } from "@/utils/Apiconfig";
import { getSubmitFormCollection } from "../../utils/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {

    const careerCollection = await getSubmitFormCollection();
    const isAccessGranted = await secureAccess(req, res);
    const { id } = req?.query;

    switch (req.method) {
        case "GET":
            if (id) {
                const user = await careerCollection.findOne({ _id: new ObjectId(id) });
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }
                res.status(200).json(user);
            } else {
                var users = await careerCollection.find().sort({ date: -1 }).toArray();
                res.status(200).json(users);
            }
            break;

        case "DELETE":
            if (id) {
                const user = await careerCollection.deleteOne({
                    _id: new ObjectId(id),
                });
                if (user.deletedCount === 0) {
                    return res.status(404).json({ message: "career inquiry not found" });
                }
                return res.status(200).json({ message: `career inquiry Deleted` });
            } else {
                return res.status(200).json({ message: `Enter career inquiry ID to Delete` });
            }

        default:
            res.status(200).json({ message: "method not allowed" });
    }
}
