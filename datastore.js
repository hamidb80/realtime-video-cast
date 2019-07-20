class DataStore {
    constructor(data = []) {
        this.data = [...data]
    }

    insert(row) {
        this.data.push(row)
    }

    exist(delimiters = {}) {
        return Boolean(this.get(delimiters))
    }

    filter(row, delimiters = {}) {
        let haveConditions = true

        for (const property in delimiters) {
            if (row[property] != delimiters[property]) {
                haveConditions = false
                break
            }
        }

        return haveConditions
    }

    get(delimiters = {}) {
        let rows = this.find(delimiters)
        return rows.length > 0 ? rows[0] : null
    }

    find(delimiters = {}) {
        return this.data.filter(row => this.filter(row, delimiters))
    }

    update(delimiters, newData) {
        this.data = this.data.map(row => {

            if (this.filter(row, delimiters)) {
                for (const property in newData) {
                    row[property] = newData[property]
                }
            }

            return row
        })
    }

    remove(delimiters) {
        this.data = this.data.filter(row => !this.filter(row, delimiters))
    }

    sortBy(propertyName) {
        this.data = this.data.sort((a, b) => {
            if (a[propertyName] > b[propertyName]) {
                return 1
            } 
            else if (a[propertyName] < b[propertyName]) {
                return -1
            }

            return 0
        })
    }

    clear() {
        this.data = []
    }
}


function test() {
    let db = new DataStore()

    let names = ['ali', 'reza', 'hasan', 'mohammad', 'morteza', 'mahdi']

    for (let i = 0; i < names.length; i++) {
        db.insert({
            id: i + 1,
            name: names[i],
            online: true
        })
    }
}


module.exports = DataStore