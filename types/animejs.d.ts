declare module "animejs" {
  type EasingOptions =
    | "linear"
    | "easeInQuad" | "easeOutQuad" | "easeInOutQuad"
    | "easeInCubic" | "easeOutCubic" | "easeInOutCubic"
    | "easeInQuart" | "easeOutQuart" | "easeInOutQuart"
    | "easeInQuint" | "easeOutQuint" | "easeInOutQuint"
    | "easeInSine" | "easeOutSine" | "easeInOutSine"
    | "easeInExpo" | "easeOutExpo" | "easeInOutExpo"
    | "easeInCirc" | "easeOutCirc" | "easeInOutCirc"
    | "easeInBack" | "easeOutBack" | "easeInOutBack"
    | "easeInBounce" | "easeOutBounce" | "easeInOutBounce"
    | "easeInElastic" | "easeOutElastic" | "easeInOutElastic"
    | string;

  type FunctionBasedParameter = (el: Element, i: number, total: number) => number;
  type AnimeValue = string | number | FunctionBasedParameter | [number, number] | [string, string];

  interface StaggerOptions {
    start?: number | string;
    from?: "first" | "center" | "last" | number;
    direction?: "normal" | "reverse";
    easing?: EasingOptions;
    grid?: [number, number];
    axis?: "x" | "y";
  }

  interface AnimeParams {
    targets?: string | Element | Element[] | NodeList | null;
    duration?: number | FunctionBasedParameter;
    delay?: number | FunctionBasedParameter;
    endDelay?: number | FunctionBasedParameter;
    easing?: EasingOptions;
    round?: number | boolean;
    loop?: number | boolean;
    direction?: "normal" | "reverse" | "alternate";
    autoplay?: boolean;
    keyframes?: AnimeParams[];
    begin?: (anim: AnimeInstance) => void;
    complete?: (anim: AnimeInstance) => void;
    update?: (anim: AnimeInstance) => void;
    changeBegin?: (anim: AnimeInstance) => void;
    changeComplete?: (anim: AnimeInstance) => void;
    loopBegin?: (anim: AnimeInstance) => void;
    loopComplete?: (anim: AnimeInstance) => void;
    [property: string]: AnimeValue | FunctionBasedParameter | unknown;
  }

  interface AnimeTimelineInstance {
    add(params: AnimeParams, offset?: number | string): AnimeTimelineInstance;
    play(): void;
    pause(): void;
    restart(): void;
    reverse(): void;
    seek(time: number): void;
    finished: Promise<void>;
  }

  interface AnimeInstance {
    play(): void;
    pause(): void;
    restart(): void;
    reverse(): void;
    seek(time: number): void;
    finished: Promise<void>;
    duration: number;
    currentTime: number;
    progress: number;
    paused: boolean;
    completed: boolean;
  }

  interface AnimeStatic {
    (params: AnimeParams): AnimeInstance;
    timeline(params?: Partial<AnimeParams>): AnimeTimelineInstance;
    stagger(value: number | string, options?: StaggerOptions): FunctionBasedParameter;
    random(min: number, max: number): number;
    get(targets: string | Element, prop: string): string | number;
    set(targets: string | Element | Element[], props: Record<string, AnimeValue>): void;
    remove(targets: string | Element | Element[]): void;
    running: AnimeInstance[];
  }

  const anime: AnimeStatic;
  export default anime;
  export = anime;
}
