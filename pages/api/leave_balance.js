import { secureAccess } from "@/utils/Apiconfig";
import { getLeaveBalance } from "@/utils/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {

    const LeaveBalance = await getLeaveBalance();
    const isAccessGranted = await secureAccess(req, res);
    const { id } = req.query;

    switch (req.method) {
        case "GET":
            if (id) {
                let leaveBalance = await LeaveBalance.find({ employee_id: id }).toArray();
                res.status(200).send(leaveBalance);
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
                    },
                    {
                        $project: {
                            first_name: "$emp.first_name",
                            last_name: "$emp.last_name",
                            emp_id: "$emp.employee_id",
                            profile: "$emp.employee_profile",
                            status: "$emp.status",
                            employee_id: 1,
                            planned_leave: 1,
                            unplanned_leave: 1
                        }
                    },
                    { $match: { status: "active" } }
                ]
                let leaveBalance = await LeaveBalance.aggregate(pipeline).toArray();
                res.status(200).send(leaveBalance);
            }
            break;

        case "PUT":
            let updateLeaveBalance = await LeaveBalance.updateOne(
                { employee_id: req.body.employee_id },
                { $set: { ...req.body } },
                { upsert: true, returnOriginal: false }
            );
            res.status(200).send(updateLeaveBalance);
            break;

        case "DELETE":
            let deleteLeaveBalance = await LeaveBalance.deleteOne({ _id: new ObjectId(id) });
            res.status(200).send(deleteLeaveBalance);
            break;

        default:
            break;
    }
}