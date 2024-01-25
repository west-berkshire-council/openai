//uses chatGPT to return redacted text
//optionally you can pass "place" and/or "dates" across as a parameter
//if either of these exist it will also redact them from the text

//uses //the URL to call chatGPT API
const axios = require("axios");

//the URL for the chatGPT API
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

//chatGPT can be slow so add a long timeout
const TIMEOUT = 100000;

try {

    //get the key for ChatGPT API, you will need to change this if your key is stored elsewere
    const apikey = await this.invokeEP('config.live.OpenAI.chatgpt', {});
    let response = "";

    const {
        text,
        place,
        dates
    } = params;

    //check if the places paramater is present and true and if so redact place names
    const placetext = place ? " and place names " : "";

    //check if the dates paramater is present and true and if so redact dates
    const datetext = dates ? " and dates " : "";

    //call to chatGPT
    const askChatGPT = async (chatInstructions) => {
        const options = {
            url: OPENAI_API_URL,
            method: "post",
            data: {
                "model": "gpt-4",
                "messages": chatInstructions,
                "temperature": 0,
            },
            timeout: TIMEOUT,
            headers: {
                "Authorization": apikey.apikey
            }
        };

        try {
            const resp = await axios(options);
            return resp.data;
        } catch (ex) {
            throw new Error("Something went wrong calling chatGPT: " + ex.message);
        }
    };

    //set the paramaters to pass to Chat GPT
    if (text) {
        const chatInstructions = [{
                "role": "system",
                "content": `You are an assistant that redacts all names${placetext}${datetext}with the text [REDACTED].`
            },
            {
                "role": "user",
                "content": text
            }
        ];
        response = await askChatGPT(chatInstructions);
    }

    //return response from chatGPT
    return response.choices[0] ? response.choices[0].message : "";

} catch (error) {
    console.error("An error occurred:", error.message);
    return "Something went wrong processing the text.";
}
