import { MongoClient } from "mongodb";
require('dotenv').config();
const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

let cachedClient = null;

export async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  cachedClient = client;

  return client;
}

// employee bank details
export async function getBankDetailCollection() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("emp_bank_detail");
}

// holidays
export async function getHolidayCollection() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("holidays");
}
// employ general details
export async function emp_general_detail() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("emp_general_detail");
}
// employ personal details
export async function employees() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("employees");
}
// employ leaves details
export async function getEmpLeaves() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("emp_leaves");
}

// add educationdata
export async function getEducationCollection() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("emp_education");
}

// add employee data
export async function getEmployeeCollection() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("employee");
}

export async function getEmploymentHistoryCollection() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("employment_history");
}

export async function getAdminData() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("admin");
}

export async function getEvents() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("events");
}
export async function getBlogCollection() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("blogdata");
}
export async function getPortfolioCollection() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("portfolio");
}

export async function getBlogCategoryCollection() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("blogcategory");
}



// inquery 
export async function getInquiryData() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("inquirydata");
}

// career
export async function getSubmitFormCollection() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("career");
}

// Admin
export async function getAdminCollection() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("admins");
}

export async function getJobCollection() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("jobs");
}

export async function getProjects() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("projects");
}
export async function getProjectMembers() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("project_members");
}
export async function getFormCollection() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("newsletter");
}

export async function getDepartmentCollection() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("department");
}

export async function getDesignationCollection() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("designation");
}

export async function getEmployeeQualificationCollection() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("employee_qualification");
}

export async function getEventParticipants() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("event_participants");
}

export async function getEmployeeBankInfo() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("employee_bank_info");
}
export async function getMedia() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("media");
}
export async function getEmployeeDocuments() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("employee_documents");
}
export async function getProjectAttachments() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("project_attachments");
}
export async function getProjectInvoices() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("project_invoices");
}
export async function getLeaveBalance() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("leave_balance");
}
export async function getLeaves() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("leave");
}
export async function getOTP() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("otp_verification");
}
export async function getChangeRequest() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("change_request");
}
export async function getUserAccess() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("user_access");
}
export async function getLeads() {
  const client = await connectToDatabase();
  return client.db(dbName).collection("leads");
}