import { secureAccess } from "@/utils/Apiconfig";
import { getProjectMembers } from "@/utils/mongodb";

export default async function handler(req, res) {

  const members = await getProjectMembers();
  const isAccessGranted = await secureAccess(req, res);
  const { project_id } = req.query

  switch (req.method) {
    case "GET":
      if (project_id) {
        const memberList = await members.find({ project_id }).toArray()
        if (memberList) {
          return res.status(200).json(memberList)
        }
        return res.status(404).json({ message: "Project not Found" })
      } else {
        const all = await members.find({}).toArray()
        return res.status(200).json(all)
      }
    case "POST":
      const { newMembers, deleteMembers } = req.body
      let results = {}
      if (newMembers) {
        const newMembersList = await members.insertMany(newMembers);
        results = { ...results, ...newMembers }
      }
      if (deleteMembers) {
        const deleteusers = await members.deleteMany({
          project_id: { $in: deleteMembers.map(d => d.project_id) },
          employee_id: { $in: deleteMembers.map(d => d.employee_id) }
        });
        results = { ...results, ...deleteusers }
      }
      return res.status(200).json(results);
    default:
      return res.status(200).json({ message: "method not allowed" });
  }
}