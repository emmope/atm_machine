const fs = require("fs");
const prompts = require('prompts');

function readDb() {
  const previousData = fs.readFileSync("database.txt", "utf8");
  const database = JSON.parse(previousData);
  return database;
}

function findUser(accountNumber){
    const user = database.find((elem) => {
        return elem.accountNumber === accountNumber;
      });
      if (!customer) {
        console.log("customer not found, try again");
       return null
      }
      return user
}

function UpdateDb(data){
   let db = readDb()
   const position  =  db.findIndex((item)=>{
    return item.accountNumber == data.accountNumber
   })
   let removed = db.splice(position, 1, data)
   fs.writeFileSync("database.txt", JSON.stringify(db), "utf8");

}
class AtmUser {
  name;
  pin;
  phoneNumber;
  accountNumber;
  balance = 0.0;

  constructor(name, pin) {
    this.name = name;
    this.pin = pin;
    this.accountNumber = Math.floor(Math.random() * 1000000000 * 10 * 1);
    const database = readDb();
    database.push(this);
    fs.writeFileSync("database.txt", JSON.stringify(database), "utf8");
console.log(`Your accountNumber is: ${this.accountNumber}`)
console.log(`Your Pin is: ${this.pin}`)
  }
}

class BankTransaction {
  user;
  response
  constructor() {}
  async createAccount() {
    let name = await prompts({
        type: 'text',
        name: 'name',
        message: 'What is your Name?',
    })
    let pin = await prompts({
        type: 'number',
        name: 'pin',
        message: 'Enter 4 digit pin number?',
    })
    this.user = new AtmUser(name.name, pin.pin);

    let response = await this.doSomethingElse()
    this.analyzeChoice(response)

  }

  async insertCardToLogin() {
    const {accountNumber, pin} = await this.promptToLogin()
    const database = readDb();
    const customer = findUser(accountNumber)
    if (customer && customer.pin == pin) {
      console.log(`Welcome ${customer.name} Bank PHB`);
      this.user = customer;
      console.log("-----------------------------");
      return customer
    } else {
      console.log("Invalid Account number / pin");
      this.insertCardToLogin();
    }
  }
  
  async displayService() {
    const services = {
    openAccount: 1,
    deposit: 2,
    withdrawal: 3,
    check_balance: 4,
    };
    console.log("Select the digit that represent the service you want");
    console.log("Type 1 to open a new account");
    console.log("Type 2 for deposit");
    console.log("Type 3 for withdrawal");
    console.log("Type 4 to check balance");
    
    let num = await prompts({
        type: 'number',
        name: 'value',
        message: 'Enter the number of your choice from the services displayed',
    });
    num = Number(num.value);
    switch (num) {
        case services.openAccount:     
       this.createAccount()
            break;
      case services.deposit:
       this.user =  await this.insertCardToLogin()
        console.log("How much do you want to deposit");
            let amount = await prompts({
                type: 'number',
                name: 'value',
                message: 'Enter the amount to deposit)',
            })
        this.user.balance += amount.value; 
        UpdateDb(this.user)
        console.log(`You have successfully depoited ${amount.value}`)
         this.response = await this.doSomethingElse();
        while (Number.isNaN(this.response)) {
          console.log("that was an invalid number");
          this.displayService()
        }
       this.analyzeChoice(this.response)
        break;
      case services.withdrawal:
         this.user =  await this.insertCardToLogin()
        console.log("How much do you want to withdraw");
            let withdrawAmount;
            withdrawAmount = await prompts({
                type: 'number',
                name: 'value',
                message: 'Enter the amount to withdraw)',
            })
            while(this.user.balance < withdrawAmount.value){
                console.log('Insufficient balance')
                withdrawAmount = await prompts({
                    type: 'number',
                    name: 'value',
                    message: 'Enter a lesser amount to withdraw)',
            })
        }
          
            
        this.user.balance -= withdrawAmount.value;
        console.log(`You have succefully withdrawn ${withdrawAmount.value}`)
        UpdateDb(this.user)
        console.log(`Available balance is ${this.user.balance}, Thanks for Banking with us....`)
        let reply = await this.doSomethingElse();
        while (Number.isNaN(reply)) {
          console.log("that was an invalid number");
          this.displayService()
        }
       this.analyzeChoice(reply)

            
        break;
      case services.check_balance:
        this.user =  await this.insertCardToLogin()
        console.log("Your acccount balance is ", this.user.balance);
        let response = await this.doSomethingElse();
        while (Number.isNaN(response)) {
          console.log("that was an invalid number");
          this.displayService()
        }
       this.analyzeChoice(response)
        break;
      default:
        console.log("invalid digit select");
        this.displayService();
    }
  }
  async doSomethingElse() {
    console.log("would you like to do something else");
    console.log("Type 1 for YES");
    console.log("Type 2 for NO");
    let num = await prompts({
        type: 'number',
        name: 'value',
        message: 'Enter 1 or 2',
    });
    return num.value;
  }
  async promptToLogin() {
    let accountNumber = await prompts({
        type: 'number',
        name: 'value',
        message: 'Enter your account number',
    });
    let pin = await prompts({
        type: 'number',
        name: 'value',
        message: 'Enter your pin',
    });

    while (Number.isNaN(accountNumber.value) && Number.isNaN(pin.value)) {
      console.log("account number and pin must be valid digits");
      this.promptToLogin()
    }
    accountNumber = Number(accountNumber.value);
    pin = Number(pin.value);
    return {accountNumber, pin}
  }

  analyzeChoice(value){

     this.response = Number(value);
    if (this.response == 1) {
      this.displayService();
    } else if (this.response == 2) {
      console.log("Thank you for banking with us");
      process.exit(1);
    } else {
      this.insertCardToLogin()
    }
}
}

module.exports = { AtmUser, BankTransaction };
