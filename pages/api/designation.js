import { secureAccess } from "@/utils/Apiconfig";
import { getDesignationCollection } from "@/utils/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {

    const designations = await getDesignationCollection();
    const isAccessGranted = await secureAccess(req, res);
    const { id } = req.query

    switch (req.method) {
        case "GET":
            const designationList = await designations.find().toArray()
            if (designationList) {
                return res.status(200).json(designationList)
            }
            return res.status(404).json({ message: "error" })
        case "POST":
            if (!req.body) {
                return res.status(404).json({ message: "Please add Data" });
            } else {
                const { name } = req.body
                var result = await designations.insertOne({ name });
                return res.status(200).json(req.body);
            }
        case "PUT":
            if (id) {
                var result = await designations.findOneAndUpdate(
                    { _id: new ObjectId(id) },
                    { $set: { ...req.body } },
                    { returnOriginal: false }
                );
                if (!result.value) {
                    return res.status(404).json({ message: "designation Not Found" });
                }
                return res.status(200).json(result.value);
            } else {
                return res.status(404).json({ message: "Require ID To Update Data" });
            }
        case "DELETE":
            if (id) {
                const designation = await designations.deleteOne({
                    _id: new ObjectId(id),
                });
                if (designation.deletedCount === 0) {
                    return res.status(404).json({ message: "designation not found" });
                }
                return res.status(200).json({ message: `designation Deleted ${id}` });
            }

        default:
            return res.status(200).json({ message: "method not allowed" });
    }
}