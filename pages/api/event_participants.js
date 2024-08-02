import { ObjectId } from "mongodb";
import { getEventParticipants } from "../../utils/mongodb";
import { secureAccess } from "@/utils/Apiconfig";

export default async function handler(req, res) {

    const eventParticipants = await getEventParticipants();
    const isAccessGranted = await secureAccess(req, res);
    const { event_id, employee_id } = req.query

    switch (req.method) {
        case "GET":
            if (event_id) {
                const participantList = await eventParticipants.find({ event_id }).toArray()
                if (participantList) {
                    return res.status(200).json(participantList)
                }
                return res.status(404).json({ message: "Event not Found" })
            } else {
                const all = await eventParticipants.find({}).toArray()
                return res.status(200).json(all)
            }

        case "POST":
            const { newMembers, deleteMembers } = req.body
            let results = {}
            if (newMembers) {
                const particiapantData = newMembers.map((d) => {
                    return {
                        ...d, participate_status: 'pending',
                        reject_reason: null,
                        created_date: new Date(),
                        updated_date: new Date(),
                    }
                })
                const newMembersList = await eventParticipants.insertMany(particiapantData);
                results = { ...results, ...newMembers }
            }
            if (deleteMembers) {
                const deleteusers = await eventParticipants.deleteMany({
                    event_id: { $in: deleteMembers.map(d => d.event_id) },
                    employee_id: { $in: deleteMembers.map(d => d.employee_id) }
                });
                results = { ...results, ...deleteusers }
            }
            return res.status(200).json(results);
        case "PUT":
            if (event_id && employee_id) {
                const { participate_status, reject_reason } = req.body;

                if (!participate_status) {
                    return res.status(400).json({ message: "Missing required parameters" });
                }

                const result = await eventParticipants.updateOne(
                    { event_id, employee_id },
                    { $set: { participate_status, reject_reason, updated_date: new Date() } }
                );
                return res.status(200).json({ message: "Participant's status updated successfully" });
            } else {
                return res.status(400).json({ message: "Missing event_id parameter" });
            }

        case "DELETE":
            if (event_id) {
                const event = await eventParticipants.deleteOne({
                    _id: new ObjectId(event_id),
                });
                if (event.deletedCount === 0) {
                    return res.status(404).json({ message: "User not found" });
                }
                return res.status(200).json({ message: `User Deleted ${event_id}` });
            }
        default:
            return res.status(405).json({ message: "Method not allowed" });
    }
}
