import { secureAccess } from "@/utils/Apiconfig";
import { getEmpLeaves } from "@/utils/mongodb"
import moment from "moment";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {

  const leaveDetails = await getEmpLeaves();
  const isAccessGranted = await secureAccess(req, res);
  const { emp_id, leave_id } = req.query;

  switch (req.method) {
    case "GET":
      if (emp_id) {
        const pipeline = [
          {
            $lookup: {
              from: "emp_personal_detail",
              localField: "emp_id",
              foreignField: "emp_id",
              as: "employeeDetail"
            }
          },
          {
            $unwind: "$employeeDetail"
          },
          {
            $project: {
              emp_id: 1,
              leave_type: 1,
              start_date: 1,
              end_date: 1,
              status: 1,
              reason: 1,
              submission_date: 1,
              response_date: 1,
              admin_id: 1,
              cancel_date: 1,
              cancel_reason: 1,
              admin_added_leave: 1,
              sl_type: 1,
              duration: 1,
              name: "$employeeDetail.first_name",
              last_name: "$employeeDetail.last_name"
            }
          }
        ];
        const result = await leaveDetails.aggregate(pipeline).toArray();
        return res.status(200).json(result);
      } else {
        var details = await leaveDetails.find().toArray();
        return res.status(200).json(details);
      }
    case "PUT":
      if (req.query.emp_id && leave_id) {
        var result = await leaveDetails.findOneAndUpdate(
          { _id: new ObjectId(leave_id), emp_id: req.query.emp_id },
          { $set: { ...req.body } },
          { returnOriginal: false }
        );
        if (!result.value) {
          return res.status(404).json({ message: "Leave not found" });
        }
        return res.status(200).json(result.value);
      } else {
        return res.status(404).json({ message: "Please insert the empID adn LeaveID" });
      }
    case "POST":
      const { emp_id, leave_type, start_date, end_date, status, reason, submission_date, response_date, admin_id, cancel_date, cancel_reason, duration, admin_added_leave, sl_type } = req.body
      const leaveAdd = await leaveDetails.insertOne({
        emp_id, leave_type, start_date, end_date, status: "Pending", reason, submission_date: moment().format('YYYY-MM-DD'),
        response_date, admin_id, duration, cancel_date, cancel_reason, admin_added_leave, sl_type
      });
      return res.status(200).json(leaveAdd);
    case "DELETE":
      if (leave_id) {
        var result = await leaveDetails.deleteOne({ _id: new ObjectId(leave_id) });
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Leaves not found" });
        }
        return res.status(200).json({ message: "Leave deleted" });
      } else {
        return res.status(404).json({ message: "Leave ID or Emp ID not Founded" });
      }
    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}
