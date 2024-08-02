const { getEmployeeBankInfo } = require("@/utils/mongodb");

export default async function handler(req, res) {

    const EmployeeBankInfo = await getEmployeeBankInfo();

    const { id } = req.query;
    switch (req.method) {
        case "GET":
            let result = await EmployeeBankInfo.findOne({ employee_id: id });
            res.status(200).send(result);
            break;

        case "PUT":
            let updateResult = await EmployeeBankInfo.updateOne(
                { "employee_id": req.body.employee_id },
                {
                    $set: { ...req.body }
                },
                {
                    upsert: true,
                    returnOriginal: false
                }
            );
            res.status(200).send(updateResult);
            break;

        default:
            break;
    }
}