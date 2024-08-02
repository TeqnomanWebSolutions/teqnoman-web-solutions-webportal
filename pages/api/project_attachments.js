import { getProjectAttachments } from "../../utils/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {

    const ProjectAttachments = await getProjectAttachments();

    switch (req.method) {
        case "POST":
            let insertResponse = await ProjectAttachments.insertOne(req.body);
            res.status(200).send(insertResponse);
            break;

        case "DELETE":
            let deleteResponse = await ProjectAttachments.deleteOne({ attachment_id: req.query.attachment_id, project_id: req.query.project_id });
            res.status(200).send(deleteResponse);
            break;
        default:
            break;
    }
}