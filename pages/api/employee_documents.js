import { secureAccess } from "@/utils/Apiconfig";
import { getEmployeeDocuments } from "@/utils/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {

    const EmployeeDocuments = await getEmployeeDocuments();
    const { id, employee_id, media_id } = req.query;
    const isAccessGranted = await secureAccess(req, res);

    switch (req.method) {
        case "GET":
            let pipeline = [
                { $addFields: { "media_object_id": { "$toObjectId": "$media_id" } } },
                { $match: { employee_id: id } },
                {
                    $lookup: {
                        from: "media",
                        localField: "media_object_id",
                        foreignField: "_id",
                        as: "media"
                    }
                },
                {
                    $unwind: "$media"
                },
                {
                    $project: {
                        employee_id: 1,
                        media_id: 1,
                        name: 1,
                        filename: "$media.name",
                        url: "$media.url"
                    }
                }
            ]
            let result = await EmployeeDocuments.aggregate(pipeline).toArray();
            res.status(200).send(result);
            break;

        case "POST":
            let newDoc = await EmployeeDocuments.insertOne(req.body);
            res.status(200).send(newDoc);
            break;

        case "DELETE":
            let deleteDoc = await EmployeeDocuments.deleteOne({ _id: new ObjectId(id), media_id: media_id, employee_id: employee_id });
            res.status(200).send(deleteDoc);
            break;

        default:
            break;
    }
}