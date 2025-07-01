export default interface SectionSchedule{
    id? :number,
    sectionId?: number,
    day?: string,
    startTime? : string, //expected format "HH:MM"
    endTime? : string
}