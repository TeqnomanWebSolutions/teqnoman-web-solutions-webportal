import { getLeads } from "@/utils/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {

    const Leads = await getLeads();
    const { id, check, uid } = req.query;

    switch (req.method) {
        case "GET":
            if (check) {
                let pipeline = [
                    {
                        $match: {
                            $expr: {
                                $in: [
                                    uid,
                                    "$assignee"
                                ]
                            }
                        }
                    },
                    {
                        $count: "total"
                    }
                ];
                let result = await Leads.aggregate(pipeline).toArray();
                res.status(200).send(result[0]);
            } else if (id) {
                let result = await Leads.findOne({ _id: new ObjectId(id) });
                res.status(200).send(result);
            } else if (uid) {
                let pipeline = [
                    {
                        $match: {
                            $expr: {
                                $in: [
                                    uid,
                                    "$assignee"
                                ]
                            }
                        }
                    }
                ];
                let result = await Leads.aggregate(pipeline).toArray();
                res.status(200).send(result);
            }
            break;

        default:
            break;
    }
}