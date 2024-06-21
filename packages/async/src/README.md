```ts
import { KafkaTransporter } from "@vermi/events/transporter/kafka";
import { events } from "@vermi/events";
import { Vermi } from "@vermi/core";
import { UserEventStore } from "./events/User";

new Vermi()
  .use(
    events("user", {
      transporter: KafkaTransporter,
      stores: [UserEventStore],
      options: { brokers: ["localhost:9092"] }
    })
  )
  .use(
    events("notification", {
      transporter: WebSocketTransporter,
      stores: [UserEventStore],
      options: { port: 3000 }
    })
  )
```

```ts
@EventStore()
class UserEventStore {
  @EventStore("notification") notificationStore: EventStore;

  @Subscribe("user.created")
  @Publish("email.sent")
  @OnException("email.failed")
  async userCreated(event: UserCreatedEvent) {
    // handle user created event
    return notificationStore.publish("notification.sent", { userId: event.userId });
  }

  @Subscribe("user.updated")
  async userUpdated(event: UserUpdatedEvent) {
    // handle user updated event
  }
}
```