 const axios = require("axios");
    const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
    const TIMEOUT = 100000;

    try {

        //get the key for ChatGPT API
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

        return response.choices && response.choices[0] ? response.choices[0].message : "";
    } catch (error) {
        console.error("An error occurred:", error.message);
        return "Something went wrong processing the text.";
    }