import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Ingredient from 'App/Models/Ingredient'
import NewIngredientValidator from 'App/Validators/NewIngredientValidator'
import UpdateIngredientValidator from 'App/Validators/UpdateIngredientValidator'

export default class IngredientsController {

    public async index ({ response }: HttpContextContract) {
      const ingredients = await Ingredient.query()
        return response.json(ingredients)
    }
    public async store ({ request, response }: HttpContextContract) {
      const {image, ...data} = await request.validate(NewIngredientValidator)
      
      const ingredient = await Ingredient.create(data)
      if (image){
        ingredient.image = Attachment.fromFile(image)
      }
      return response.json(ingredient)
    }
    public async show ({ params, response }: HttpContextContract) {
        const ingredient = await Ingredient.find(params.id)
        return response.json(ingredient)
    }
    public async update ({ params, request, response }: HttpContextContract) {
        const data = await request.validate(UpdateIngredientValidator)
        const ingredient = await Ingredient.findOrFail(params.id)
        ingredient.merge(data)
        await ingredient.save()
        return response.json(ingredient)
    }
}
