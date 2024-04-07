const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbpath = path.join(__dirname, 'cricketMatchDetails.db')
let db = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3002, () => {
      console.log('success')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDbAndServer()

const hasPriorityAndStatusProperties = (requestQuery) => {  
 return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined  
  );
};

const hasPriorityProperty = (requestQuery) => {    
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {  
  return requestQuery.status !== undefined;
};

app.get('/todos/', async (request, response) => {
    let data = null;
    let getTodosQuery = '';
    const {search_q = '', priority, status} = request.query;
    switch (true) {
        case hasPriorityAndStatusProperties(request.query):
        getTodosQuery = `
         SELECT 
          *
         FROM
          todo
         WHERE
          todo like '%${search_q}%'
          AND status = '${status}'
          AND priority = '${priority}';
         `;
         break;
        case hasPriorityProperty(request.query):
        getTodosQuery = `
         SELECT
          *
         FROM 
          todo
         WHERE
          todo LIKE '%${search_q}%'
          AND priority = '${priority}';
         `;
         break;
        case hasStatusProperty(request.query):
         getTodosQuery = `
         SELECT
          *
         FROM
          todo
         WHERE 
          todo LIKE '%${search_q}%'
          AND status = '${status}';
         `;
         break;
        default:
         getTodosQuery = `
           SELECT 
            *
           FROM
            todo
           WHERE 
           todo LIKE '%${search_q}%'
         `;

    }
    data = await database.all(getTodosQuery);
    response.send(data)
});

app.get('/todos/:todoId/', async (request, response) => {
    const {todoId} = request.params
    const getTodoQuery = `
    SELECT 
     *
    FROM
     todo
    WHERE
     id = '${todoId}';
    `;
    const todo = await database.get(getTodoQuery);
    response.send(todo)
});

app.post('/todos/', async (request, response) => {
    const {id, priority, status, todo} = request.body;
    const postTodoQuery = `
    INSERT INTO
     todo (id, todo, priority, status)
    VALUES
     (${id}, '${todo}', '${priority}', '${status}');
    `;
    await database.run(postTodoQuery)
    response.send("Todo Successfully Added")
});

app.put('/todos/:todoId/', async (request, response) => {
    const { todoId } = request.params;
    let updatedColoumn = '';
    const requestBody = request.body;
    switch (true) {
        case requestBody.status !== undefined:
         updatedColoumn = 'Status';
         break;
        case requestBody.priority !== undefined:
         updatedColoumn = 'Priority';
         break;
        case requestBody.todo !== undefined:
         updatedColoumn = 'Todo';
         break;
    }
    const previousTodoQuery = `
    SELECT
     *
    FROM 
     todo
    WHERE
     id = ${todoId};
    `;
    const previousTodo = await database.get(previousTodoQuery)
    const {
        todo = previousTodo.todo,
        priority = previousTodo.priority,
        status = previousTodo.status
    } = request.body
    const updateTodoQuery = `
    UPDATE
     todo
    SET 
     todo = '${todo}',
     priority = '${priority}',
     status = '${status}'
    WHERE 
     id = ${todoId};
    `;
    await database.run(updateTodoQuery)
    response.send(`${updatedColoumn} Updated`)
});


app.delete('/todos/:todoId/', async (request, response) =>{
    const {todoId} = request.params;
    const deleteQuery = `
    DELETE FROM
     todo
    WHERE
     id = ${todoId};
    `;
    await database.run(deleteQuery)
    response.send("Todo Deleted");
});

module.exports = app;