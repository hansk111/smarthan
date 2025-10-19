import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/* -------------------------------------------------
   1️⃣  타입 정의
   ------------------------------------------------- */
export type MbtiDimension = "EI" | "SN" | "TF" | "JP";
export type Answer = "A" | "B"; // 두 선택지

/* MBTI 차원별 A/B 가 의미하는 문자 */
export const MBTI_MAP = {
    EI: { A: "I", B: "E" },
    SN: { A: "S", B: "N" },
    TF: { A: "T", B: "F" },
    JP: { A: "J", B: "P" },
} as const;

/* 질문 하나의 형태 */
export interface Question {
    id: number;
    text: string;
    dimension: MbtiDimension;
    optionA: string; // UI에 보여줄 텍스트
    optionB: string;
    /** 답변이 가리키는 값 – 현재는 "A" | "B" 로 고정 */
    optionAValue: Answer;
    optionBValue: Answer;
}

/* 슬라이스 전체 상태 */
interface MbtiState {
    EI: { A: number; B: number };
    SN: { A: number; B: number };
    TF: { A: number; B: number };
    JP: { A: number; B: number };
    currentIndex: number;
    questions: Question[];
    result?: string; // e.g. "INTJ"
}

/* -------------------------------------------------
   2️⃣  초기 상태 (20문항)
   ------------------------------------------------- */
const initialState: MbtiState = {
    EI: { A: 0, B: 0 },
    SN: { A: 0, B: 0 },
    TF: { A: 0, B: 0 },
    JP: { A: 0, B: 0 },
    currentIndex: 0,
    questions: [
        // ────────────────────── EI ──────────────────────
        {
            id: 1,
            text: "새로운 사람을 만날 때…",
            dimension: "EI",
            optionA: "조용히 관찰한다",
            optionB: "즉시 대화를 시작한다",
            optionAValue: "A",
            optionBValue: "B",
        },
        {
            id: 2,
            text: "혼자 있을 때 가장 편안한 이유는…",
            dimension: "EI",
            optionA: "생각을 정리할 수 있기 때문",
            optionB: "다른 사람과 에너지를 교환할 수 있기 때문",
            optionAValue: "A",
            optionBValue: "B",
        },
        {
            id: 3,
            text: "주말에 주로 하는 활동은…",
            dimension: "EI",
            optionA: "집에서 책을 읽거나 영화를 본다",
            optionB: "친구와 모임을 갖거나 외출한다",
            optionAValue: "A",
            optionBValue: "B",
        },
        {
            id: 4,
            text: "팀 프로젝트에서 주로 맡는 역할은…",
            dimension: "EI",
            optionA: "자료 정리·분석, 뒤에서 지원하는 역할",
            optionB: "아이디어 제시·프레젠테이션, 앞에 나서는 역할",
            optionAValue: "A",
            optionBValue: "B",
        },
        {
            id: 5,
            text: "모든 일정을 미리 정해두는 것이 좋아요.",
            dimension: "EI",
            optionA: "예, 계획을 미리 세우는 것이 안심된다",
            optionB: "아니요, 상황에 따라 즉흥적으로 움직이는 게 좋다",
            optionAValue: "A",
            optionBValue: "B",
        },

        // ────────────────────── SN ──────────────────────
        {
            id: 6,
            text: "새로운 정보를 받아들일 때…",
            dimension: "SN",
            optionA: "구체적인 사실과 사례에 집중한다",
            optionB: "가능성·아이디어·큰 그림을 떠올린다",
            optionAValue: "A",
            optionBValue: "B",
        },
        {
            id: 7,
            text: "문제를 해결할 때 가장 먼저 하는 일은…",
            dimension: "SN",
            optionA: "현재 상황을 정확히 파악한다",
            optionB: "다른 가능성을 탐색한다",
            optionAValue: "A",
            optionBValue: "B",
        },
        {
            id: 8,
            text: "여행을 계획할 때…",
            dimension: "SN",
            optionA: "관광명소·맛집 등 실질적인 일정표를 만든다",
            optionB: "어디에서 영감을 받을지, 어떤 분위기를 느낄지 상상한다",
            optionAValue: "A",
            optionBValue: "B",
        },
        {
            id: 9,
            text: "읽은 책을 기억하는 방식은…",
            dimension: "SN",
            optionA: "구체적인 에피소드와 디테일을 떠올린다",
            optionB: "전반적인 주제와 핵심 아이디어를 떠올린다",
            optionAValue: "A",
            optionBValue: "B",
        },
        {
            id: 10,
            text: "새로운 기술을 배울 때…",
            dimension: "SN",
            optionA: "단계별 매뉴얼을 따라 차근차근 진행한다",
            optionB: "큰 그림을 먼저 이해하고 자유롭게 탐색한다",
            optionAValue: "A",
            optionBValue: "B",
        },

        // ────────────────────── TF ──────────────────────
        {
            id: 11,
            text: "어떤 결정을 할 때 가장 중시하는 기준은…",
            dimension: "TF",
            optionA: "논리와 객관적인 근거",
            optionB: "사람들의 감정과 관계",
            optionAValue: "A",
            optionBValue: "B",
        },
        {
            id: 12,
            text: "다른 사람이 실수를 했을 때 내 반응은…",
            dimension: "TF",
            optionA: "왜 그런 실수가 발생했는지 원인을 분석한다",
            optionB: "그 사람에게 위로와 격려의 말을 건넨다",
            optionAValue: "A",
            optionBValue: "B",
        },
        {
            id: 13,
            text: "동료와 의견 차이가 있을 때 나는…",
            dimension: "TF",
            optionA: "데이터와 논리를 들어 설득한다",
            optionB: "상대의 감정을 배려해 조율한다",
            optionAValue: "A",
            optionBValue: "B",
        },
        {
            id: 14,
            text: "프로젝트 결과를 평가할 때 가장 먼저 보는 것은…",
            dimension: "TF",
            optionA: "목표 달성도와 효율성",
            optionB: "팀 분위기와 구성원 만족도",
            optionAValue: "A",
            optionBValue: "B",
        },
        {
            id: 15,
            text: "친구가 고민을 털어놓을 때 나는…",
            dimension: "TF",
            optionA: "문제 해결을 위한 구체적인 조언을 준다",
            optionB: "공감하고 감정을 함께 나눈다",
            optionAValue: "A",
            optionBValue: "B",
        },

        // ────────────────────── JP ──────────────────────
        {
            id: 16,
            text: "일정을 잡을 때 나는…",
            dimension: "JP",
            optionA: "미리 계획을 세우고 일정을 확정한다",
            optionB: "그때그때 상황에 맞게 유연하게 잡는다",
            optionAValue: "A",
            optionBValue: "B",
        },
        {
            id: 17,
            text: "업무 마감일이 다가오면 나는…",
            dimension: "JP",
            optionA: "우선순위를 정해 차례대로 진행한다",
            optionB: "마감 직전까지 아이디어를 더 추가하는 경우가 많다",
            optionAValue: "A",
            optionBValue: "B",
        },
        {
            id: 18,
            text: "친구가 갑자기 여행 제안을 하면 나는…",
            dimension: "JP",
            optionA: "일정을 바로 짜서 확정한다",
            optionB: "그냥 떠날 준비가 될 때까지 기다린다",
            optionAValue: "A",
            optionBValue: "B",
        },
        {
            id: 19,
            text: "책을 읽을 때 나는…",
            dimension: "JP",
            optionA: "목차와 챕터 순서대로 차근차근 읽는다",
            optionB: "흥미로운 부분을 골라 자유롭게 읽는다",
            optionAValue: "A",
            optionBValue: "B",
        },
        {
            id: 20,
            text: "새로운 프로젝트에 참여할 때 나는…",
            dimension: "JP",
            optionA: "역할과 일정, 목표를 미리 명확히 정의한다",
            optionB: "큰 목표만 잡고 진행 중에 디테일을 채워간다",
            optionAValue: "A",
            optionBValue: "B",
        },
    ],
};

/* -------------------------------------------------
   3️⃣  Slice 정의
   ------------------------------------------------- */
const mbtiSlice = createSlice({
    name: "mbti",
    initialState,
    reducers: {
        /** 사용자가 A 혹은 B 를 선택했을 때 호출 */
        answerQuestion: (
            state,
            action: PayloadAction<{ dimension: MbtiDimension; answer: Answer }>
        ) => {
            const { dimension, answer } = action.payload;
            // 차원별 A/B 카운트를 1씩 증가
            state[dimension][answer] += 1;
            // 다음 질문으로 이동
            state.currentIndex += 1;
        },

        /** 모든 질문을 다 풀면 MBTI 결과 문자열을 만든다 */
        calculateResult: (state) => {
            const result = (["EI", "SN", "TF", "JP"] as const)
                .map((dim) => {
                    const counts = state[dim];
                    const map = MBTI_MAP[dim];
                    return counts.A >= counts.B ? map.A : map.B;
                })
                .join("");

            state.result = result;
            console.log("result:", result)
        },

        /** 테스트를 처음부터 다시 시작 */
        restart: (state) => {
            state.EI = { A: 0, B: 0 };
            state.SN = { A: 0, B: 0 };
            state.TF = { A: 0, B: 0 };
            state.JP = { A: 0, B: 0 };
            state.currentIndex = 0;
            state.result = undefined;
        },
    },
});

/* -------------------------------------------------
   4️⃣  Export
   ------------------------------------------------- */
export const { answerQuestion, calculateResult, restart } = mbtiSlice.actions;
export default mbtiSlice.reducer;