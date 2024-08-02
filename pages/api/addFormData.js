import { ObjectId } from "mongodb";
import { getInquiryData } from "../../utils/mongodb";
import { secureAccess } from "@/utils/Apiconfig";

export default async function handler(req, res) {
    const contactCollection = await getInquiryData();
    const payload = req?.body;
    const isAccessGranted = await secureAccess(req, res);
    const { id } = req.query
    switch (req.method) {
        case "GET":
            if (id) {
                const user = await contactCollection.findOne({ _id: new ObjectId(id) });
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }
                res.status(200).json(user);
            } else {
                var users = await contactCollection.find().toArray();
                res.status(200).json(users);
            }
            break;

        case "DELETE":
            if (id) {
                const user = await contactCollection.deleteOne({
                    _id: new ObjectId(id),
                });
                if (user.deletedCount === 0) {
                    return res.status(404).json({ message: "contact not found" });
                }
                return res.status(200).json({ message: `contact Deleted` });
            } else {
                return res.status(200).json({ message: `Enter contact ID to Delete` });
            }
        default:
            res.status(405).json({ message: "Method not allowed" });
            break;
    }
}
