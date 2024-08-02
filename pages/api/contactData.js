import { ObjectId } from "mongodb";
import { getInquiryData } from "../../utils/mongodb";

export default async function handler(req, res) {

    const contactCollection = await getInquiryData();
    switch (req.method) {
        case "GET":
            if (req.id) {
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

        case "PUT":
            var result = await contactCollection.findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: { deleted: true } },
                { returnOriginal: false }
            );
            if (!result.value) {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(200).json(result.value);
            break;

        case "DELETE":
            if (req.query.id) {
                var result = await contactCollection.deleteOne({ _id: new ObjectId(req.query.id) });
                if (result.deletedCount === 0) {
                    return res.status(404).json({ message: "User not found" });
                }
                res.status(200).json({ message: "User deleted" });
            }
            break;
        default:
            res.status(405).json({ message: "Method not allowed" });
            break;
    }
}
