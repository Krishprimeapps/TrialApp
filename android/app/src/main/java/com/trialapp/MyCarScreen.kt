import androidx.car.app.CarContext
import androidx.car.app.Screen
import androidx.car.app.model.*

class MyCarScreen(carContext: CarContext) : Screen(carContext) {
    override fun onGetTemplate(): Template {
        val title = "Welcome to TrialApp!"
        val message = "This is a sample Android Auto screen."

        val itemList = ItemList.Builder()
            .addItem(
                Row.Builder()
                    .setTitle("Hello Android Auto!")
                    .addText(message)
                    .build()
            )
            .build()

        return ListTemplate.Builder()
            .setSingleList(itemList)
            .setTitle(title)
            .setHeaderAction(Action.BACK)
            .build()
    }
}
