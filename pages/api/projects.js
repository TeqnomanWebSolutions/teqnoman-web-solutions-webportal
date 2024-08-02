import { secureAccess } from "@/utils/Apiconfig";
import { getProjects, getProjectMembers } from "../../utils/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {

  const projectDetails = await getProjects()
  const projectMembers = await getProjectMembers()
  const isAccessGranted = await secureAccess(req, res);
  const { project_id, employee_id } = req?.query;

  switch (req.method) {
    case "GET":
      if (project_id) {
        const pipeline = [
          { "$addFields": { "project_id": { "$toString": "$_id" } } },
          {
            $match: { _id: new ObjectId(project_id) }
          },
          {
            $lookup: {
              from: "project_members",
              localField: "project_id",
              foreignField: "project_id",
              as: "project_members",
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
              attachments: 1,
              employee_data: "$project_members.employee_data",
            }
          }
        ];
        const project = await projectDetails.aggregate(pipeline).toArray()
        if (!project) {
          return res.status(404).json({ message: "Project not found" });
        }
        return res.status(200).json(project[0]);
      } else if (employee_id) {
        const pipeline = [
          { $match: { employee_id } },
          { "$addFields": { "project_id": { "$toObjectId": "$project_id" } } },
          {
            $lookup: {
              from: 'projects',
              localField: 'project_id',
              foreignField: '_id',
              as: 'projects',
              pipeline: [
                { "$addFields": { "_id": { "$toString": "$_id" } } },
                {
                  $lookup: {
                    from: 'project_members',
                    localField: "_id",
                    foreignField: "project_id",
                    as: "project_members",
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
                          employee_id: "$employeedata._id",
                          employee_profile: "$employeedata.employee_profile",
                          first_name: "$employeedata.first_name",
                          last_name: "$employeedata.last_name"
                        }
                      }
                    ]
                  }
                }
              ]
            }
          },
          {
            $unwind: {
              path: "$projects",
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $project: {
              _id: "$projects._id",
              name: "$projects.name",
              type: "$projects.type",
              status: "$projects.status",
              start_date: "$projects.start_date",
              end_date: "$projects.end_date",
              description: "$projects.description",
              is_deleted: "$projects.is_deleted",
              project_members: "$projects.project_members",
              attachments: 1,
            }
          }
        ]
        const project = await projectMembers.aggregate(pipeline).toArray()
        if (!project) {
          return res.status(404).json({ message: "Project not found" });
        }
        return res.status(200).json(project);
      }
      else {
        const pipeline = [
          { "$addFields": { "project_id": { "$toString": "$_id" } } },
          {
            $lookup: {
              from: "project_members",
              localField: "project_id",
              foreignField: "project_id",
              as: "project_members",
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
              employee_data: "$project_members.employee_data",
            }
          }
        ]
        var allProjects = await projectDetails.aggregate(pipeline).toArray();
        return res.status(200).json(allProjects);
      }
      break;

    case "POST":
      const { name, type, start_date, end_date, status, description, attachments } = req.body
      var result = await projectDetails.insertOne({ name, type, start_date, end_date, status, description, created_date: new Date(), updated_date: new Date(), is_deleted: false, attachments });
      return res.status(200).json({ ...result });
      break;

    case "PUT":
      if (project_id) {
        var result = await projectDetails.findOneAndUpdate(
          { _id: new ObjectId(project_id) },
          { $set: { ...req.body, updated_date: new Date() } },
          { returnOriginal: false }
        );
        if (!result.value) {
          return res.status(404).json({ message: "Project not found" });
        }
        return res.status(200).json(result.value);
      }
      return res.status(404).json({ message: "Require ID To Update Data" });
      break;

    case "DELETE":
      if (project_id) {
        const project = await projectDetails.deleteOne({
          _id: new ObjectId(project_id),
        });
        if (project.deletedCount === 0) {
          return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ message: `User Deleted ${project_id}` });
      }
      break;

    default:
      return res.status(200).json({ message: "method not allowed" });
  }
}
