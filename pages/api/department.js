import { secureAccess } from "@/utils/Apiconfig";
import { getDepartmentCollection } from "@/utils/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {

    const departments = await getDepartmentCollection();
    const isAccessGranted = await secureAccess(req, res);
    const { id } = req.query

    switch (req.method) {
        case "GET":
            const departmentList = await departments.find().toArray()
            if (departmentList) {
                return res.status(200).json(departmentList)
            }
            return res.status(404).json({ message: "error" })
        case "POST":
            if (!req.body) {
                return res.status(404).json({ message: "Please add Data" });
            } else {
                const { name } = req.body
                var result = await departments.insertOne({ name });
                return res.status(200).json(req.body);
            }
        case "PUT":
            if (id) {
                var result = await departments.findOneAndUpdate(
                    { _id: new ObjectId(id) },
                    { $set: { ...req.body } },
                    { returnOriginal: false }
                );
                if (!result.value) {
                    return res.status(404).json({ message: "department Not Found" });
                }
                return res.status(200).json(result.value);
            } else {
                return res.status(404).json({ message: "Require ID To Update Data" });
            }
        case "DELETE":
            if (id) {
                const department = await departments.deleteOne({
                    _id: new ObjectId(id),
                });
                if (department.deletedCount === 0) {
                    return res.status(404).json({ message: "department not found" });
                }
                return res.status(200).json({ message: `department Deleted ${id}` });
            }
        default:
            return res.status(200).json({ message: "method not allowed" });
    }
}