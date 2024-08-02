import { secureAccess } from "@/utils/Apiconfig";
import { getUserAccess } from "../../utils/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
    const UserAccess = await getUserAccess();
    await secureAccess(req,res)
    const { id } = req.query;
    switch (req.method) {
        case "GET":
            if (id) {
                let data = await UserAccess.find({ employee_id: id }).toArray();
                res.status(200).send(data);
            } else {
                let data = await UserAccess.find().toArray();
                res.status(200).send(data);
            }
            break;

        case "PUT":
            let result = await UserAccess.updateOne(
                { employee_id: req.body.employee_id },
                { $set: { ...req.body } },
                { upsert: true }
            );
            res.status(200).send(result);
            break;

        case "DELETE":
            let deleteRow = await UserAccess.deleteOne({ employee_id: req.query.id });
            res.status(200).send(deleteRow);
            break;
        default:
            break;
    }
}