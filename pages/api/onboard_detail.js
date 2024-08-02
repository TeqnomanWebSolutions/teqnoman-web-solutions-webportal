import { ObjectId } from "mongodb";
import {
    getBankDetailCollection, 
    getEducationCollection,
    getEmploymentHistoryCollection
} from "../../utils/mongodb";


export default async function handler(req, res) {
    const bankdetail = await getBankDetailCollection(); 
    const educationDetail = await getEducationCollection();
    const employeementHistory = await getEmploymentHistoryCollection();

    const { id, emp_id } = req.query;
    const {
        profile_picture,
        first_name,
        middle_name,
        last_name,
        employee_id,
        birth_date,
        contact,
        emergency_contact,
        email,
        gender,
        marital_status,
        religion,
        join_date,
        linkedin_id,
        department,
        designation,
        blood_group,
        medical_issue,
        current_address_line_1,
        current_address_line_2,
        city_1,
        state_1,
        pincode_1,
        permanent_address_1,
        permanent_address_2,
        city_2,
        pincode_2,

        institute_name,
        course_name,
        percentage,

        adhaar,
        PAN,
        resume,
        certificate,
        previous_company_salary_slip,
        previous_company_experience_letter,

        account_holder_name,
        account_number,
        bank_name,
        branch_name,
        ifsc_code,
        pan_number,

        company_name,
        previous_company_role,
        previous_company_employment_type,
        previous_company_annual_package,
        previous_company_join_date,
        previous_company_resign_date,
        previous_company_description

    } = req.query;

    if (req.method == "POST") {
        const detail = await bankdetail.insertOne(req.body);
        res.status(200).json(req.body);
    }
}
