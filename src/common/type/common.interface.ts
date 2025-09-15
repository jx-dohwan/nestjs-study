type MutableArray<T> = Array<Mutable<T>>;
type MutableObject<T> = {
  -readonly [P in keyof T]: Mutable<T[P]>;
};
export type Mutable<T> =
  T extends Array<infer U>
    ? MutableArray<U>
    : T extends object
      ? MutableObject<T>
      : T;
      
type ValueType = string | number | boolean;

// 중첩된 배열 객체 속에서 string/number/boolenar같은 실제 값 타임만 뽑아내는 유틸리니
export type Union<T> =
  T extends ReadonlyArray<infer U> // 배열/튜플이면 요소 타입 U를 꺼내서
    ? Union<U>                     // 재귀적으로 Union 처리
    : T extends { [key: string]: infer U }  // 객체면 프로퍼티 값들의 합 타입 U를 꺼내서
      ? Union<U>                            // 재귀적으로 Union 처리
      : T extends ValueType                 // 최종적으로 원시값이면 그 값을 채택    
        ? T
        : never;                            // 그 외 타입은 버림
