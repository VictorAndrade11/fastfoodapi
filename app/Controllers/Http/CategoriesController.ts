import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Category from 'App/Models/Category'
import NewCategoryValidator from 'App/Validators/NewCategoryValidator'
import UpdateCategoryValidator from 'App/Validators/UpdateCategoryValidator'

export default class CategoriesController {
  public async index({ response }: HttpContextContract) {
    const categories = await Category.query().preload('products')
    return response.json(categories)
  }
  public async store({ request, response }: HttpContextContract) {
    const { name, image } = await request.validate(NewCategoryValidator)

    const category = await Category.create({ name })

    if (image){
    category.image = Attachment.fromFile(image)
    }
    await category.save()

    return response.json(category)
  }
  public async show({ params }: HttpContextContract) {
    return Category.findOrFail(params.id)
  }
  public async update({ request, response, params }: HttpContextContract) {
    const { name, image } = await request.validate(UpdateCategoryValidator)

    const category = await Category.findOrFail(params.id)

    category.merge({ name })

    if (image) {
      category.image = Attachment.fromFile(image)
    }

    await category.save()

    return response.json(category)
  }
}
