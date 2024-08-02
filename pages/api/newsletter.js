import { ObjectId } from "mongodb";
import { getFormCollection } from "../../utils/mongodb";
import { secureAccess } from "@/utils/Apiconfig";

export default async function handler(req, res) {

    const newsletterCollection = await getFormCollection();
    const { id } = req.query;
    const isAccessGranted = await secureAccess(req, res);

    switch (req.method) {
        case "GET":
            if (id) {
                const user = await newsletterCollection.findOne({ _id: new ObjectId(id), });
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }
                res.status(200).json(user);
            } else {
                var users = await newsletterCollection.find().toArray();
                res.status(200).json(users);
            }
            break;
        case "PUT":
            if (id) {
                var result = await newsletterCollection.findOneAndUpdate(
                    { _id: new ObjectId(id) },
                    { $set: { deleted: true } },
                    { returnOriginal: false }
                );
                if (!result.value) {
                    return res.status(404).json({ message: "User not found" });
                }
                res.status(200).json(result.value);
            }
            break;
        case "DELETE":
            if (id) {
                const user = await newsletterCollection.deleteOne({
                    _id: new ObjectId(id),
                });
                if (user.deletedCount === 0) {
                    return res.status(404).json({ message: "User not found" });
                }
                res.status(200).json({ message: `User Deleted ${id}` });
            }
            break;
        default:
            res.status(200).json({ message: "Method Not Allowed" });
    }
}
