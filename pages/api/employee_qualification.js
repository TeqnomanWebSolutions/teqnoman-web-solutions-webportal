import { secureAccess } from "@/utils/Apiconfig";
import { ObjectId } from "mongodb";

const { getEmployeeQualificationCollection } = require("@/utils/mongodb");

export default async function handler(req, res) {

    const EmployeeQualification = await getEmployeeQualificationCollection();
    const isAccessGranted = await secureAccess(req, res);
    const { id, row_id } = req.query;

    switch (req.method) {
        case "GET":
            if (row_id) {
                let result = await EmployeeQualification.findOne({ _id: new ObjectId(row_id) });
                res.status(200).send(result);
            }
            else {
                let result = await EmployeeQualification.find({ employee_id: id }).toArray();
                res.status(200).send(result);
            }
            break;

        case "POST":
            let insertResult = await EmployeeQualification.insertOne(req.body);
            res.status(200).send(insertResult);
            break;

        case "PUT":
            let updateResult = await EmployeeQualification.updateOne(
                { "_id": new ObjectId(id), "employee_id": req.body.employee_id },
                {
                    $set: { ...req.body }
                },
                {
                    upsert: true,
                    returnOriginal: false
                }
            );
            res.status(200).send(updateResult);
            break;

        case "DELETE":
            let deleteResult = await EmployeeQualification.deleteOne({ "_id": new ObjectId(id) });
            res.status(200).send(deleteResult);
            break;

        default:
            break;
    }
}