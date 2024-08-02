function ButtonUi({ cssClass, text, type, callBack, status, children, disabled }) {

  const btntext = text || "Text Here";
  const cssClassName = cssClass || "btnui";
  const btntype = type || "button";
  const currentStatus = status || "";

  const handleClick = (e) => {
    if (callBack) {
      return callBack(e);
    }
  };

  const statusCode = (currentStatus) => {
    switch (currentStatus) {
      case "Pending": return "btnui-warn";
      case "Approved": return "btnui-success";
      case "Rejected": return "btnui-danger";
      case "Done": return "btnui-success";
      case "In-Porgress": return "btnui-warn";
      default: return currentStatus;
    }
  };
  return (<>
    <button type={btntype} className={`${cssClassName} ${statusCode(currentStatus)}`} onClick={(e) => handleClick(e)} disabled={disabled}>
      {btntext}
      {children}
    </button>
  </>);
}

export default ButtonUi;
