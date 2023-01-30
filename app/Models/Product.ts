import { DateTime } from 'luxon'
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  ManyToMany,
  manyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import { attachment, AttachmentContract } from '@ioc:Adonis/Addons/AttachmentLite'
import Category from './Category'
import Order from './Order'
import Ingredient from './Ingredient'

export default class Product extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @attachment()
  public image: AttachmentContract

  @column()
  public name: string

  @column()
  public description: string

  @column()
  public price: number

  @column()
  public categoryId: number

  @manyToMany(()=> Ingredient, { pivotColumns: ['quantity'] })
  public ingredients: ManyToMany<typeof Ingredient>

  @belongsTo(() => Category)
  public category: BelongsTo<typeof Category>

  @manyToMany(() => Order, { pivotColumns: ['quantity'] })
  public orders: ManyToMany<typeof Order>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
