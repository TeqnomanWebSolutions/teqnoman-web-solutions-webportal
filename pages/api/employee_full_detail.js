import { secureAccess } from "@/utils/Apiconfig";
import { employees } from "../../utils/mongodb";

export default async function handler(req, res) {

    const personalDetails = await employees();
    const isAccessGranted = await secureAccess(req, res);
    const { emp_id } = req?.query;

    switch (req.method) {
        case "GET":
            const aggregatedData = await personalDetails.aggregate([
                { $match: { emp_id: emp_id } },
                {
                    $lookup: {
                        from: "employees",
                        localField: "emp_id",
                        foreignField: "emp_id",
                        as: "personal_detail",
                    },
                },
                {
                    $lookup: {
                        from: "emp_general_detail",
                        localField: "emp_id",
                        foreignField: "emp_id",
                        as: "general_detail",
                    },
                },
                {
                    $lookup: {
                        from: "emp_bank_detail",
                        localField: "emp_id",
                        foreignField: "emp_id",
                        as: "bank_detail",
                    },
                },
                {
                    $lookup: {
                        from: "emp_education",
                        localField: "emp_id",
                        foreignField: "emp_id",
                        as: "education_detail",
                    },
                },
                {
                    $lookup: {
                        from: "emp_employment_history",
                        localField: "emp_id",
                        foreignField: "emp_id",
                        as: "employment_history",
                    },
                },
                {
                    $project: {
                        _id: 0,
                        general: { $arrayElemAt: ["$general_detail", 0] },
                        personal: { $arrayElemAt: ["$personal_detail", 0] },
                        bank_detail: { $arrayElemAt: ["$bank_detail", 0] },
                        education_detail: { $arrayElemAt: ["$education_detail", 0] },
                        employment_history: { $arrayElemAt: ["$employment_history", 0] },
                    },
                },
            ]).toArray();
            return res.status(200).json(aggregatedData);

        default:
            res.status(405).json({ message: "Method not allowed" });
    }
}
