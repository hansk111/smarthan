/** MBTI 16가지 타입 */
export type MbtiCode =
    | "ISTJ" | "ISFJ" | "INFJ" | "INTJ"
    | "ISTP" | "ISFP" | "INFP" | "INTP"
    | "ESTP" | "ESFP" | "ENFP" | "ENTP"
    | "ESTJ" | "ESFJ" | "ENFJ" | "ENTJ";

/** 한 타입에 대한 상세 해설 */
export interface MbtiDetail {
    /** 한줄 요약 (예: "전략가") */
    tagline: string;

    /** 핵심 특성 리스트 */
    traits: string[];

    /** 강점·약점 (각 3~5개) */
    strengths: string[];
    weaknesses: string[];

    /** 직업·학과·관계 팁  (필요 시 자유롭게 추가) */
    career: string[];
    love: string[];
    growth: string[];

    /** 각 섹션당 아이콘(플랫폼에 맞는 이름, 예: Feather, MaterialIcons) */
    icons?: {
        traits?: string;
        strengths?: string;
        weaknesses?: string;
        career?: string;
        love?: string;
        growth?: string;
    };

    /** 썸네일 이미지(옵션) : assets 혹은 원격 URL */
    image?: string;
}