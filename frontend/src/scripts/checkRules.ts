export function getRules() {
    return {
        promptRules: [
            (v: string) => {
                if (!v.length) {
                    return 'Required'
                }
                if (v.split(" ").length > 77) {
                    return 'Too many prompts'
                }
                return true;
            }
        ],
        negPromptRules: [
            (v: string) => {
                if (v.split(" ").length > 77) {
                    return 'Too many prompts'
                }
                return true;
            }
        ],
        dimenRules: [
            (v) => {
                if (!v.length) {
                    return 'Required'
                }
                if (!(/^\d+$/.test(v))) {
                    return "Not a number"
                }
                let value = +v as number
                if (value < 32 || value > 512) {
                    return "Out of range"
                }
                if (value % 32 !== 0) {
                    return "Not multiplies of 32"
                }
                return true;
            }
        ],
        seedRules: [
            (v) => {
                if (!v.length) {
                    return 'Required'
                }
                if (!(/^(-?)\d+$/.test(v))) {
                    return "Not a number"
                }
                return true;
            }
        ],
    }
}