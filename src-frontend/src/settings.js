export function getHostPrefix() {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        return "http://localhost:5000/";
    } else {
        return "";
    }
}
// Should be SQL-conformant
export const DB_QUESTION_PREFIX = "question_";
export const DB_TBL = "qrs";