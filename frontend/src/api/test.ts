import request from "@/utils/request";
import axios from "axios";
import { BaseResponse } from ".";


export interface Ticket {
    id: number;
    name: string;
    description: string;
    priority: string;
    chat_id: string;
    flow_id: number;
    workflow_id: number;
    project_id: number;
    workflow_version_id: number;
    state: string;
    state_name: string;
    submitter: any;
    created_at: string;
    owner: any;
    operator: any;
    leader: any;
    cancelable: boolean;
    source: string;
    properties: { [key: string]: any }
    status: string;
    current_flow_status: string;
    source_type: string;
    actions: any[];
    customers: any[];
    updated_at: string;
    categories: {
        [key: number]: {
            id: number;
            name: string;
            type_id: number;
            type_name: string;
        }
    }
    tags: any[];
    files: any[];
    images: any[];
    form_version?: string;
}

export async function get(id: number): Promise<Ticket> {
          const url = `/api/tickets/${id}`
          return axios.get(url)
}

export async function ticketsDetail(id: number) {
          return request.get(`/tickets/${id}`)
}
