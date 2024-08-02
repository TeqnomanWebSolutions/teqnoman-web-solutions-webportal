import { secureAccess } from "@/utils/Apiconfig";
import { getEvents, getEventParticipants } from "../../utils/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {

  const events = await getEvents()
  const eventsMembers = await getEventParticipants()
  const isAccessGranted = await secureAccess(req, res);
  const { event_id, employee_id } = req?.query;

  switch (req.method) {
    case "GET":
      if (event_id) {
        const pipeline = [
          { "$addFields": { "event_id": { "$toString": "$_id" } } },
          {
            $match: { _id: new ObjectId(event_id) }
          },
          {
            $lookup: {
              from: "event_participants",
              localField: "event_id",
              foreignField: "event_id",
              as: "event_participants",
              pipeline: [
                { "$addFields": { "employee_object_id": { "$toObjectId": "$employee_id" } } },
                {
                  $lookup: {
                    from: "employees",
                    localField: "employee_object_id",
                    foreignField: "_id",
                    as: "employeedata",
                  }
                },
                {
                  $unwind: {
                    path: "$employeedata",
                    preserveNullAndEmptyArrays: true
                  }
                },
                {
                  $project: {
                    reject_reason: 1,
                    participate_status: 1,
                    employee_id: "$employeedata._id",
                    employee_profile: "$employeedata.employee_profile",
                    first_name: "$employeedata.first_name",
                    last_name: "$employeedata.last_name",
                    designation: "$employeedata.designation",
                    department: "$employeedata.department",
                  }
                }
              ]
            }
          },
          {
            $project: {
              name: 1,
              start_date: 1,
              description: 1,
              start_time: 1,
              duration: 1,
              employee_data: "$event_participants",
            }
          }
        ];
        const event = await events.aggregate(pipeline).toArray()
        if (!event) {
          return res.status(404).json({ message: "event not found" });
        }
        return res.status(200).json(event);
      } else if (employee_id) {
        const pipeline = [
          { "$addFields": { "event_string_id": { "$toString": "$_id" } } },
          {
            $lookup: {
              from: "event_participants",
              localField: "event_string_id",
              foreignField: "event_id",
              as: "event_participants",
              pipeline: [
                { "$addFields": { "employee_object_id": { "$toObjectId": "$employee_id" } } },
                {
                  $lookup: {
                    from: "employees",
                    localField: "employee_object_id",
                    foreignField: "_id",
                    as: "employees",
                  }
                },
                {
                  $unwind: {
                    path: "$employees",
                    preserveNullAndEmptyArrays: true
                  }
                },
                {
                  $project: {
                    employee_id: "$employees._id",
                    employee_profile: "$employees.employee_profile",
                    first_name: "$employees.first_name",
                    last_name: "$employees.last_name",
                    participate_status: 1,
                  }
                }
              ]
            }
          },
          {
            $project: {
              name: 1,
              start_date: 1,
              start_time: 1,
              description: 1,
              duration: 1,
              participate_status: 1,
              reject_reason: 1,
              employee_data: "$event_participants",
              checkMember: {
                $filter: {
                  input: "$event_participants",
                  as: "members",
                  cond: {
                    $eq: [{ "$toString": "$$members.employee_id" }, employee_id]
                  }
                }
              }
            }
          },
          { $match: { checkMember: { "$exists": true, $ne: [] } } }
        ]
        const project = await events.aggregate(pipeline).toArray();
        if (!project) {
          return res.status(404).json({ message: "Project not found" });
        }
        return res.status(200).json(project);
      }
      else {
        const pipeline = [
          { "$addFields": { "event_id": { "$toString": "$_id" } } },
          {
            $lookup: {
              from: "event_participants",
              localField: "event_id",
              foreignField: "event_id",
              as: "event_participants",
              pipeline: [
                { "$addFields": { "employee_object_id": { "$toObjectId": "$employee_id" } } },

                {
                  $lookup: {
                    from: "employees",
                    localField: "employee_object_id",
                    foreignField: "_id",
                    as: "employeedata",
                  }

                },
                {
                  $unwind: {
                    path: "$employeedata",
                    preserveNullAndEmptyArrays: true
                  }
                },
                {

                  $project: {
                    employee_data: {
                      participate_status: "$participate_status",
                      employee_id: "$employeedata._id",
                      employee_profile: "$employeedata.employee_profile",
                      first_name: "$employeedata.first_name",
                      last_name: "$employeedata.last_name"
                    }
                  }
                }
              ]
            }
          },
          {
            $project: {
              name: 1,
              type: 1,
              status: 1,
              start_date: 1,
              end_date: 1,
              description: 1,
              is_deleted: 1,
              duration: 1,
              start_time: 1,
              employee_data: "$event_participants.employee_data",
            }
          }
        ]
        var allEvents = await events.aggregate(pipeline).toArray();
        return res.status(200).json(allEvents);
      }
    case "POST":
      const { name, start_date, description, start_time, duration } = req.body
      var result = await events.insertOne({ name, start_date, description, start_time, duration, created_date: new Date() });
      return res.status(200).json({ ...result });
    case "PUT":
      if (event_id) {
        var result = await events.findOneAndUpdate(
          { _id: new ObjectId(event_id) },
          { $set: { ...req.body, updated_date: new Date() } },
          { returnOriginal: false }
        );
        if (!result.value) {
          return res.status(404).json({ message: "event not found" });
        }
        return res.status(200).json(result.value);
      }
      return res.status(404).json({ message: "Require ID To Update Data" });
    case "DELETE":
      if (event_id) {
        const event = await events.deleteOne({
          _id: new ObjectId(event_id),
        });
        if (event.deletedCount === 0) {
          return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ message: `User Deleted ${event_id}` });
      }
    default:
      return res.status(200).json({ message: "method not allowed" });
  }
}
