import { secureAccess } from "@/utils/Apiconfig";
import { getLeaves } from "@/utils/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {

    const Leaves = await getLeaves();
    const { id } = req.query;

    switch (req.method) {
        case "POST":
            let data = {
                ...req.body,
                is_cancelled: false,
                cancelled_reason: "",
                status: "pending",
                created_date: new Date(),
                updated_date: new Date(),
            }
            let insertRes = await Leaves.insertOne(data);
            res.status(200).send(insertRes);
            break;

        case "PUT":
            let updateRes = await Leaves.updateOne(
                { _id: new ObjectId(id) },
                { $set: { ...req.body, updated_date: new Date(), } },
                { upsert: true, returnOriginal: false }
            )
            res.status(200).send(updateRes);
            break;

        case "GET":
            if (id) {
                let pipeline = [
                    { "$addFields": { "employee_object_id": { "$toObjectId": "$employee_id" } } },
                    { $match: { employee_id: id } },
                    {
                        $lookup: {
                            from: "employees",
                            localField: "employee_object_id",
                            foreignField: "_id",
                            as: "emp",
                        }
                    },
                    {
                        $unwind: {
                            path: "$emp",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $sort: {
                            end_date: -1
                        }
                    },
                    {
                        $project: {
                            employee_id: 1,
                            leave_type: 1,
                            duration: 1,
                            start_date: 1,
                            end_date: 1,
                            reason: 1,
                            is_cancelled: 1,
                            cancelled_reason: 1,
                            status: 1,
                            first_name: "$emp.first_name",
                            last_name: "$emp.last_name",
                            emp_id: "$emp.employee_id",
                            profile: "$emp.employee_profile",
                            lwp_type: 1
                        }
                    }
                ]
                let result = await Leaves.aggregate(pipeline).toArray();
                res.status(200).send(result);
            } else {
                let pipeline = [
                    { "$addFields": { "employee_object_id": { "$toObjectId": "$employee_id" } } },
                    {
                        $lookup: {
                            from: "employees",
                            localField: "employee_object_id",
                            foreignField: "_id",
                            as: "emp",
                        }
                    },
                    {
                        $unwind: {
                            path: "$emp",
                            preserveNullAndEmptyArrays: true
                        }
                    }, {
                        $lookup: {
                            from: "leave_balance",
                            localField: "employee_id",
                            foreignField: "employee_id",
                            as: "leave_balance",
                        }
                    },
                    {
                        $unwind: {
                            path: "$leave_balance",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $sort: {
                            start_date: -1
                        }
                    },
                    {
                        $project: {
                            employee_id: 1,
                            leave_type: 1,
                            duration: 1,
                            start_date: 1,
                            end_date: 1,
                            reason: 1,
                            is_cancelled: 1,
                            cancelled_reason: 1,
                            status: 1,
                            first_name: "$emp.first_name",
                            last_name: "$emp.last_name",
                            emp_id: "$emp.employee_id",
                            profile: "$emp.employee_profile",
                            lwp_type: 1,
                            planned_leave: "$leave_balance.planned_leave",
                            unplanned_leave: "$leave_balance.unplanned_leave",
                        }
                    }
                ]
                let result = await Leaves.aggregate(pipeline).toArray();
                res.status(200).send(result);
            }
        default:
            break;
    }
}