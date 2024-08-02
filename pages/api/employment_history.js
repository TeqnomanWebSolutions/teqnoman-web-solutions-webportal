import { ObjectId } from "mongodb";
import { getEmploymentHistoryCollection } from "../../utils/mongodb";
import { secureAccess } from "@/utils/Apiconfig";

export default async function handler(req, res) {

    const EmploymentHistory = await getEmploymentHistoryCollection();
    const isAccessGranted = await secureAccess(req, res);
    const { id, row_id } = req.query;

    switch (req.method) {
        case "GET":
            if (id) {
                let pipeline = [
                    { $addFields: { "experience_letter_object": { "$toObjectId": "$experience_letter" } } },
                    { $addFields: { "salary_slip_object": { "$toObjectId": "$salary_slip" } } },
                    { $match: { employee_id: id } },
                    {
                        $lookup: {
                            from: "media",
                            localField: "salary_slip_object",
                            foreignField: "_id",
                            as: "salary_slip"
                        }
                    },
                    {
                        $lookup: {
                            from: "media",
                            localField: "experience_letter_object",
                            foreignField: "_id",
                            as: "experience_letter"
                        }
                    },
                    {
                        $project: {
                            company_name: 1,
                            role: 1,
                            employment_type: 1,
                            annual_package: 1,
                            join_date: 1,
                            resign_date: 1,
                            salary_slip: 1,
                            experience_letter: 1,
                            description: 1,
                            is_fresher: 1,
                            employee_id: 1,
                            experience_letter: {
                                $cond: {
                                    if: { $ne: ["$experience_letter", []] },
                                    then: { $first: "$experience_letter" },
                                    else: ""
                                }
                            },
                            salary_slip: {
                                $cond: {
                                    if: { $ne: ["$salary_slip", []] },
                                    then: { $first: "$salary_slip" },
                                    else: ""
                                }
                            },
                        }
                    }
                ]
                let result = await EmploymentHistory.aggregate(pipeline).toArray();
                res.status(200).send(result);
            } else {
                let result = await EmploymentHistory.findOne({ _id: new ObjectId(row_id) });
                res.status(200).send(result);
            }
            break;

        case "POST":
            let insertResult = await EmploymentHistory.insertOne(req.body);
            res.status(200).send(insertResult);
            break;

        case "PUT":
            let updateResult = await EmploymentHistory.updateOne(
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
            let deleteResult = await EmploymentHistory.deleteOne({ "_id": new ObjectId(id) });
            res.status(200).send(deleteResult);
            break;

        default:
            break;
    }
}