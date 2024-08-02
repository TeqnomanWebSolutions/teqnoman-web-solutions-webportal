import { secureAccess } from "@/utils/Apiconfig";
import { getProjectInvoices } from "../../utils/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {

    const ProjectInvoices = await getProjectInvoices();
    const isAccessGranted = await secureAccess(req, res);

    switch (req.method) {
        case "GET":
            let result = await ProjectInvoices.find({ project_id: req.query.project_id }).toArray();
            res.status(200).send(result);
            break;

        case "POST":
            let insertResponse = await ProjectInvoices.insertOne(req.body);
            res.status(200).send(insertResponse);
            break;

        case "PUT":
            let updateRes = await ProjectInvoices.updateOne(
                { _id: new ObjectId(req.query.id) },
                { $set: req.body },
                {
                    upsert: true,
                    returnOriginal: false
                }
            );
            res.status(200).send(updateRes);
            break;

        case "DELETE":
            let deleteResponse = await ProjectInvoices.deleteOne({ _id: new ObjectId(req.query.id) });
            res.status(200).send(deleteResponse);
            break;
        default:
            break;
    }
}