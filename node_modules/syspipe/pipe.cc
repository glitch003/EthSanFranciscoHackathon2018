#include <node.h>
#include <nan.h>

#if defined _WIN32 || defined _WIN64
   int pipe(int descf[2]) { return -1; }
#else
#  include <unistd.h>
#  include <fcntl.h>
#  include <errno.h>
   extern int errno;
#endif

#define ERRMSG "Could not create pipe"


using namespace v8;


NAN_METHOD(syspipe) {
    Nan::HandleScope scope;

    int desc[2];
    char errmsg[128];

    if (pipe(desc)) {
#if defined _WIN32 || defined _WIN64
        return Nan::ThrowError(ERRMSG);
#else
        snprintf(errmsg, sizeof(errmsg), "%s (%s)", ERRMSG, strerror(errno));
        return Nan::ThrowError(errmsg);
#endif
   }

   Local<Object> obj = Nan::New<Object>();
   obj->Set(Nan::New<String>("read").ToLocalChecked(), Nan::New<Integer>(desc[0]));
   obj->Set(Nan::New<String>("write").ToLocalChecked(), Nan::New<Integer>(desc[1]));
   info.GetReturnValue().Set(obj);
}

void init(Handle<Object> exports) {
    exports->Set(Nan::New<String>("pipe").ToLocalChecked(),
            Nan::New<FunctionTemplate>(syspipe)->GetFunction());
}

NODE_MODULE(syspipe, init)

