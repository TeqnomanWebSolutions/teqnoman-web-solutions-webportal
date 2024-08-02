import moment from "moment";
import { employees, getBlogCollection, getEvents, getHolidayCollection, getInquiryData, getJobCollection, getLeaveBalance, getLeaves, getProjects, getSubmitFormCollection } from "../../utils/mongodb";
import { secureAccess } from "@/utils/Apiconfig";

export default async function handler(req, res) {

    const employeeCount = await employees();
    const projectCount = await getProjects();
    const blogCount = await getBlogCollection();
    const LeaveBalance = await getLeaveBalance();
    const Leaves = await getLeaves();
    const Events = await getEvents();
    const Holidays = await getHolidayCollection();
    const contactCollection = await getInquiryData();
    const careerCollection = await getSubmitFormCollection();
    const jobCollection = await getJobCollection();
    const isAccessGranted = await secureAccess(req, res);
    const { id } = req.query;

    switch (req.method) {
        case 'GET':
            try {
                const e_count = await employeeCount.find({ status: "active" }).toArray();
                let p_count = null;
                if (id) {
                    let projectPipeline = [
                        { "$addFields": { "project_string_id": { "$toString": "$_id" } } },
                        { $match: { is_deleted: false } },
                        {
                            $lookup: {
                                from: "project_members",
                                localField: "project_string_id",
                                foreignField: "project_id",
                                as: "project_members",
                                pipeline: [
                                    { $match: { employee_id: id } },
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
                                project_string_id: 1,
                                project_members: 1,
                            }
                        },
                        { $match: { project_members: { "$exists": true, $ne: [] } } }
                    ]
                    p_count = await projectCount.aggregate(projectPipeline).toArray();
                } else {
                    p_count = await projectCount.find({ is_deleted: false }).toArray();
                }
                const b_count = await blogCount.find().toArray();
                const leaveBalance = await LeaveBalance.find({ employee_id: id }).toArray();
                let leavesPipeline = [];
                if (id) {
                    leavesPipeline = [
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
                                cancelled_reason: 1,
                                is_cancelled: 1,
                                status: 1,
                                created_date: 1,
                                updated_date: 1,
                                emp_id: "$emp.employee_id",
                                first_name: "$emp.first_name",
                                last_name: "$emp.last_name",
                                profile: "$emp.employee_profile"
                            }
                        }
                    ]
                } else {
                    leavesPipeline = [
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
                                cancelled_reason: 1,
                                is_cancelled: 1,
                                status: 1,
                                created_date: 1,
                                updated_date: 1,
                                emp_id: "$emp.employee_id",
                                first_name: "$emp.first_name",
                                last_name: "$emp.last_name",
                                profile: "$emp.employee_profile"
                            }
                        }
                    ]
                }
                const leaves = await Leaves.aggregate(leavesPipeline).toArray();
                let eventsData = null;
                if (id) {
                    let eventsPipeline = [
                        { "$addFields": { "event_string_id": { "$toString": "$_id" } } },
                        {
                            $lookup: {
                                from: "event_participants",
                                localField: "event_string_id",
                                foreignField: "event_id",
                                as: "event_participants",
                                pipeline: [
                                    { $match: { employee_id: id, participate_status: "approved" } },
                                ]
                            }
                        },
                        {
                            $project: {
                                name: 1,
                                start_date: 1,
                                start_time: 1,
                                duration: 1,
                                event_participants: 1,
                            }
                        },
                        { $match: { event_participants: { "$exists": true, $ne: [] } } },
                    ]
                    eventsData = await Events.aggregate(eventsPipeline).toArray();
                } else {
                    eventsData = await Events.find().toArray();
                }
                const holidaysData = await Holidays.find().toArray();
                const contacts = await contactCollection.find().sort({ date: -1 }).toArray();
                const careers = await careerCollection.find().toArray();
                const jobs = await jobCollection.find().toArray();
                let contactData = contacts

                const currentDate = moment();

                let filteredEventData = eventsData.filter(event => moment(event.start_date).isSameOrAfter(currentDate, 'day'))
                    .sort((a, b) => moment(a.start_date).diff(moment(b.start_date)))


                const currentYear = new Date().getFullYear();
                let filteredBirthdayData = e_count.filter(d => d.status !== 'onboard').map(person => {
                    const birthDate = new Date(person.birth_date);
                    birthDate.setFullYear(currentYear);
                    return { ...person, birth_date: birthDate };
                }).sort((a, b) => a.birth_date - b.birth_date);

                const result = {
                    employees: e_count.length,
                    projects: p_count.length,
                    careerLength: careers.length,
                    blogs: b_count.length,
                    planned_leave: leaveBalance.length === 0 ? 0 : leaveBalance[0].planned_leave,
                    unplanned_leave: leaveBalance.length === 0 ? 0 : leaveBalance[0].unplanned_leave,
                    leaves: leaves,
                    eventsData: filteredEventData,
                    holidaysData: holidaysData,
                    birthdayData: filteredBirthdayData.filter((d) => moment(d.birth_date).isAfter()).slice(0, 3),
                    projectData: p_count.length === 0 ? [] : p_count.slice(0, 3),
                    contactData: contactData,
                    jobsLength: jobs
                };
                res.status(200).json(result);
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: "Internal Server Error" });
            }
            break;

        default:
            res.status(405).json({ error: "Method Not Allowed" });
            break;
    }
}

