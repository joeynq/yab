```ts
use(domain(UserDomain, { eventEmitter: new EventEmitter() }))

// or

@Module({ deps: [] })
@UseModule(UserDomain, { eventEmitter: new EventEmitter() })
@UseModule(RouterModule, { mount: "/users", controllers: [] })
class UserModule implements VermiModule<UserModuleConfig> {

}
```
