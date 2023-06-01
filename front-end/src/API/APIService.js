import axios from "axios";

export default class APIService {
    static async auth(username, password) {
        return await axios.post('127.0.0.2', {username, password})
    }
}