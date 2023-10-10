/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async knex => {
  return knex.schema
    .createTable('user', table => {
      table.increments('id').primary().unique()
      table.string('name').notNullable()
      table.string('email').notNullable().unique()
      table.string('password').notNullable()
      table.boolean('is_active').defaultTo(true)
    })
    .createTable('user_membership', table => {
      table.increments('id').primary().unique()
      table.integer('membership_type').notNullable().defaultTo(0)
      table
        .integer('user_id')
        .references('id')
        .inTable('user')
        .onDelete('CASCADE')
    })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async knex => {
  return knex.schema.dropTableIfExists('user')
}
