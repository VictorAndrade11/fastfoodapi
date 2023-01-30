import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, beforeSave, column, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import Product from './Product'
import { orderStatus } from 'App/constants/orderStatus'

export default class Order extends BaseModel {

  @beforeCreate()
  static async setStatus(order: Order){
    if (order.$dirty.status && orderStatus.includes(order.$dirty.status.toUpperCase())) {
      order.status = order.$dirty.status.toUpperCase()
    }
    order.status = 'PENDING'
  }
  @beforeSave()
  static async setStatusOnSave(order: Order){
    if (order.$dirty.status && orderStatus.includes(order.$dirty.status.toUpperCase())) {
      order.status = order.$dirty.status.toUpperCase()
    }
  }

  @column({ isPrimary: true })
  public id: number

  @column()
  public userName: string

  @manyToMany(() => Product, { pivotColumns: ['quantity'] })
  public products: ManyToMany<typeof Product>

  @column()
  public total: number

  @column()
  public status: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
