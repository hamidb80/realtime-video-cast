import { Model, User } from './models';
import { anyStringVal as Delimiters } from "./utils";

export class DataStore<T extends Model> {
    data: Array<T>;
    sortBy: string;

    constructor(sortBy = '', data = Array<T>()) {
        this.data = [...data]
        this.sortBy = sortBy
    }

    insert(row: T) {
        this.data.push(row)
    }

    exist(delimiters: Delimiters) {
        return Boolean(this.find(delimiters).length)
    }

    filter(row: T, delimiters: Delimiters) {
        let haveConditions = true

        for (const property in delimiters) {
            if (row.get(property) != delimiters[property]) {
                haveConditions = false
                break
            }
        }

        return haveConditions
    }

    get(delimiters: Delimiters): T {
        let rows = this.find(delimiters)

        if (rows.length == 0)
            throw Error('There is no row with ' + delimiters)

        return rows[0]
    }

    find(delimiters: Delimiters) {
        if (this.sortBy)
            this.sort()

        return this.data.filter(row => this.filter(row, delimiters))
    }

    update(delimiters: Delimiters, newData: Delimiters) {
        this.data = this.data.map(row => {

            if (this.filter(row, delimiters)) {
                for (const property in newData) {
                    row.set(property, newData[property])
                }
            }

            return row
        })
    }

    remove(delimiters: Delimiters) {
        this.data = this.data.filter(row => !this.filter(row, delimiters))
    }

    sort(propertyName = this.sortBy) {
        this.data = this.data.sort((a: T, b: T) => {
            let a_val = a.get(propertyName),
                b_val = b.get(propertyName)

            if (a_val > b_val) return 1
            else if (a_val < b_val) return -1
            else return 0
        })
    }

    clear() {
        this.data = []
    }
}

