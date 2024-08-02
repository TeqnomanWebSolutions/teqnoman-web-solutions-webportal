import { ObjectId } from "mongodb";
import { getJobCollection } from "../../utils/mongodb";
import { secureAccess } from "@/utils/Apiconfig";

export default async function handler(req, res) {

    const addJobs = await getJobCollection();
    const isAccessGranted = await secureAccess(req, res);
    const { id } = req.query;

    switch (req.method) {
        case "GET":
            if (id) {
                const user = await addJobs.findOne({ _id: new ObjectId(id) });
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }
                res.status(200).json(user);
            } else {
                var users = await addJobs.find().toArray();
                res.status(200).json(users);
            }
            break;

        case "POST":
            var result = await addJobs.insertOne({
                ...req.body,
                status: "open",
                created_date: new Date(),
            });
            res.status(201).json({ message: "add success" });
            break;


        case "PUT":
            if (id) {
                var result = await addJobs.findOneAndUpdate(
                    { _id: new ObjectId(id) },
                    {
                        $set: { ...req.body, modifiedDate: new Date() },
                    },
                    { returnOriginal: false }
                );
                if (!result) {
                    return res.status(404).json({ message: "Job not found" });
                }
                res.status(200).json(result.value);
            }
            else {
                res.status(400).json({ message: "Insert id" });
            }
            break;


        case "DELETE":
            if (id) {
                var result = await addJobs.deleteOne({ _id: new ObjectId(id) });
                if (result.deletedCount === 0) {
                    return res.status(404).json({ message: "User not found" });
                }
                res.status(200).json({ message: "job deleted" });
            }

            break;

        default:
            res.status(405).json({ message: "Method not allowed" });
            break;
    }
}
