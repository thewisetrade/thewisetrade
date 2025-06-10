
import * as widget from '@/public/libraries/charting_library/charting_library.js'
import * as datafeeds from '@/public/libraries/datafeeds/udf/dist/bundle.js'
export default defineNuxtPlugin(() => {
    return {
        provide: {
            widget,
            datafeeds,
        },
    };
});