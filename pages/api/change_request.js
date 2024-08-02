import { getChangeRequest, employees } from "@/utils/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
    const ChangeRequest = await getChangeRequest();
    const Employee = await employees();

    const { id } = req.query;
    switch (req.method) {

        case "GET":
            let pipeLine = [
                { "$addFields": { "id": { "$toString": "$_id" } } },
                {
                    $lookup: {
                        from: "change_request",
                        localField: "id",
                        foreignField: "user_id",
                        as: "change_request"
                    },
                },
                {
                    $project: {
                        employee_id: 1,
                        change_request: "$change_request",
                        is_user_changes: { $gt: [{ $size: "$change_request" }, 0] },
                    }
                },
                { $match: { is_user_changes: true } },
            ]
            let result = await Employee.aggregate(pipeLine).toArray();
            res.status(200).send(result);
            break;

        case "POST":
            let requests = req.body;
            if (requests.length != 0) {
                requests.map(async (ch) => {
                    if (ch.row_id) {
                        await ChangeRequest.updateOne(
                            { "user_id": ch.user_id, "fieldName": ch.fieldName, "row_id": ch.row_id },
                            {
                                $set: { ...ch }
                            },
                            {
                                upsert: true,
                                returnOriginal: false
                            }
                        )
                    } else {
                        await ChangeRequest.updateOne(
                            { "user_id": ch.user_id, "fieldName": ch.fieldName },
                            {
                                $set: { ...ch }
                            },
                            {
                                upsert: true,
                                returnOriginal: false
                            }
                        )
                    }
                })
            }
            // let insertData = await ChangeRequest.insertMany(req.body);
            res.status(200).send("Added");
            break;

        case "DELETE":
            let deleteData = await ChangeRequest.deleteOne({ _id: new ObjectId(id) });
            res.status(200).send(deleteData);
            break;
        default:
            break;
    }
}