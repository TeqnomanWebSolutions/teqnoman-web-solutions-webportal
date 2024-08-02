const FileThumbnail = ({ name, width, height }) => {
    width = width || 40;
    height = height || 40;
    name = name || "test.jpg"
    const fileExtension = name.split('.').pop();

    switch (fileExtension) {
        case 'pdf':
            return (<img height={height} src={'/images/icons/pdf.png'} />);
        case 'jpg':
            return (<img height={height} src={'/images/icons/image.png'} />);
        case 'jpeg':
            return (<img height={height} src={'/images/icons/image.png'} />);
        case 'png':
            return (<img height={height} src={'/images/icons/image.png'} />);
        case 'docx':
            return (<img height={height} src={'/images/icons/word.png'} />);
        case 'doc':
            return (<img height={height} src={'/images/icons/word.png'} />);
        case 'xlsx':
            return (<img height={height} src={'/images/icons/excel.png'} />);
        case 'xlsx':
            return (<img height={height} src={'/images/icons/excel.png'} />);
        default:
            return (<img height={height} src={'/images/icons/image.png'} />);
    }
}
export default FileThumbnail;